import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email, password, name }: {
            email: string
            password: string,
            name: string
        } = await req.json();

        const BACKEND_URL = process.env.BACKEND_URL!;

        const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Fallo en el registro');
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ success: false, error: error.message })
        }
    }
}