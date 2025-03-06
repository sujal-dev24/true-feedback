import dbConnect from '@/lib/DBconnection';
import UserModel from '@/model/User';
import mongoose from 'mongoose';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user = session?.user as User;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(_user._id);

  try {
    // Check if the user exists
    const userExists = await UserModel.findById(userId).exec();
    if (!userExists) {
      return Response.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

    // Aggregate user messages
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      {
        $project: {
          messages: { $ifNull: ['$messages', []] }, // Ensure messages is an array
        },
      },
      { $unwind: '$messages' },
      { $sort: { 'messages.createdAt': -1 } },
      { $group: { _id: '$_id', messages: { $push: '$messages' } } },
    ]).exec();

    // Check if messages were found
    if (!user || user.length === 0 || !user[0].messages) {
      return Response.json(
        { message: 'No messages found for the user', success: false },
        { status: 404 }
      );
    }

    // Return the messages
    return Response.json(
      { messages: user[0].messages },
      { status: 200 }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}