import { Router } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import auth from '../middleware/auth.mid.js';
import admin from '../middleware/admin.mid.js';
import { UserModel } from '../models/user.model.js';
import { sendVerificationEmail } from '../helpers/mail.helper.js';
import crypto from 'crypto';

// Импортируем правильные константы
const HTTP_BAD_REQUEST = 400;
const HTTP_OK = 200;

const router = Router();
const PASSWORD_HASH_SALT_ROUNDS = 10;

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.send(generateTokenResponse(user));
      return;
    }

    res.status(HTTP_BAD_REQUEST).send('Username or password is invalid');
  })
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password, address } = req.body;

    const user = await UserModel.findOne({ email });

    if (user) {
      res.status(HTTP_BAD_REQUEST).send('User already exists, please login!');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      password,
      PASSWORD_HASH_SALT_ROUNDS
    );

    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      address,
    };

    const result = await UserModel.create(newUser);
    res.send(generateTokenResponse(result));
  })
);

router.put(
  '/updateProfile',
  auth,
  asyncHandler(async (req, res) => {
    const { name, address } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      { name, address },
      { new: true }
    );

    res.send(generateTokenResponse(user));
  })
);

router.put(
  '/changePassword',
  auth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      res.status(HTTP_BAD_REQUEST).send('Change Password Failed!');
      return;
    }

    const equal = await bcrypt.compare(currentPassword, user.password);

    if (!equal) {
      res.status(HTTP_BAD_REQUEST).send('Current Password Is Not Correct!');
      return;
    }

    user.password = await bcrypt.hash(newPassword, PASSWORD_HASH_SALT_ROUNDS);
    await user.save();

    res.send();
  })
);

router.get(
  '/getall/:searchTerm?',
  admin,
  asyncHandler(async (req, res) => {
    const { searchTerm } = req.params;

    const filter = searchTerm
      ? { name: { $regex: new RegExp(searchTerm, 'i') } }
      : {};

    const users = await UserModel.find(filter, { password: 0 });
    res.send(users);
  })
);

router.put(
  '/toggleBlock/:userId',
  admin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (userId === req.user.id) {
      res.status(HTTP_BAD_REQUEST).send("Can't block yourself!");
      return;
    }

    const user = await UserModel.findById(userId);
    user.isBlocked = !user.isBlocked;
    user.save();

    res.send(user.isBlocked);
  })
);

router.get(
  '/getById/:userId',
  admin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await UserModel.findById(userId, { password: 0 });
    res.send(user);
  })
);

router.put(
  '/update',
  admin,
  asyncHandler(async (req, res) => {
    const { id, name, email, address, isAdmin } = req.body;
    await UserModel.findByIdAndUpdate(id, {
      name,
      email,
      address,
      isAdmin,
    });

    res.send();
  })
);

router.post('/sendVerification', auth, asyncHandler(async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return res.status(HTTP_BAD_REQUEST).send({ message: 'User not found' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        user.emailVerificationToken = verificationToken;
        await user.save();

        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        
        await sendVerificationEmail(user.email, verificationLink);
        
        res.status(HTTP_OK).send({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Error in sendVerification:', error);
        res.status(HTTP_BAD_REQUEST).send({ message: 'Failed to send verification email', error: error.message });
    }
}));

router.post('/verify-email', asyncHandler(async (req, res) => {
    try {
        const { token } = req.body;
        const user = await UserModel.findOne({ emailVerificationToken: token });
        
        if (!user) {
            return res.status(HTTP_BAD_REQUEST).send({ message: 'Invalid verification token' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        res.status(HTTP_OK).send({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error in verify-email:', error);
        res.status(HTTP_BAD_REQUEST).send({ message: 'Verification failed', error: error.message });
    }
}));

router.get('/profile', auth, asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user.id);
    res.send(user);
}));

const generateTokenResponse = user => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    address: user.address,
    isAdmin: user.isAdmin,
    token,
  };
};

export default router;
