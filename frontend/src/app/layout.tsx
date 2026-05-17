import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "AI Interview Platform | Next-Gen Hiring Intelligence",
    description: "AI-powered interview platform that evaluates candidates on technical skills, communication, and coding ability. Built for modern recruiting teams.",
    keywords: "AI interview, automated hiring, technical assessment, coding interview, candidate evaluation",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body className="antialiased bg-[#030712] min-h-screen">
                {children}
            </body>
        </html>
    );
}
