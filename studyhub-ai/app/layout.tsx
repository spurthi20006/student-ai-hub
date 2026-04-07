import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "StudyHub AI — Smart Study Assistant for Students",
  description:
    "AI-powered study assistant: summarize notes, ask questions, generate flashcards, and get data-backed campus placement tips using Hugging Face models and real Kaggle recruitment data.",
  keywords: ["study assistant", "AI", "notes summarizer", "flashcards", "placement tips", "students"],
  authors: [{ name: "StudyHub AI" }],
  openGraph: {
    title: "StudyHub AI — Smart Study Assistant",
    description: "Summarize notes · Ask questions · Generate flashcards · Get placement tips",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
