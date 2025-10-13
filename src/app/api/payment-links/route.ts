import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'stackfunds';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

// Generate a unique short ID for payment links
function generatePaymentLinkId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'amount', 'creatorAddress', 'paymentToken'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Generate unique payment link ID
    let paymentLinkId = generatePaymentLinkId();
    
    const client = await clientPromise;
    const db = client.db(MONGODB_DB);
    const collection = db.collection('paymentLinks');

    // Ensure unique ID
    while (await collection.findOne({ paymentLinkId })) {
      paymentLinkId = generatePaymentLinkId();
    }

    // Create payment link document
    const paymentLinkDoc = {
      paymentLinkId,
      title: body.title,
      description: body.description,
      amount: parseFloat(body.amount),
      duration: parseInt(body.duration) || 30,
      paymentToken: body.paymentToken,
      creatorAddress: body.creatorAddress,
      creatorId: body.creatorId,
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(body.expiresAt),
      payments: [], // Array to store payments made to this link
      totalPaid: 0,
      paymentCount: 0
    };

    const result = await collection.insertOne(paymentLinkDoc);

    return NextResponse.json({
      success: true,
      paymentLinkId,
      _id: result.insertedId,
      message: 'Payment link created successfully'
    });

  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorAddress = searchParams.get('creatorAddress');
    const paymentLinkId = searchParams.get('id');

    const client = await clientPromise;
    const db = client.db(MONGODB_DB);
    const collection = db.collection('paymentLinks');

    if (paymentLinkId) {
      // Get specific payment link
      const paymentLink = await collection.findOne({ paymentLinkId });
      
      if (!paymentLink) {
        return NextResponse.json(
          { error: 'Payment link not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(paymentLink);
    }

    if (creatorAddress) {
      // Get all payment links for a creator
      const paymentLinks = await collection
        .find({ creatorAddress })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({
        success: true,
        paymentLinks,
        total: paymentLinks.length
      });
    }

    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching payment links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment links' },
      { status: 500 }
    );
  }
}