import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components';

interface EmailTemplateProps {
    username?: string;
    otp: string;
}

export function VerificationEmail({
    username,
    otp,
}: EmailTemplateProps) {
    return (
        <Html lang='en' dir='ltr'>
            <Head />
            <Preview>Your verification</Preview>
            <Tailwind>
                <Body className="bg-slate-50 my-auto mx-auto font-sans">
                    <Container className="border border-solid border-slate-200 rounded-lg my-[40px] mx-auto p-[20px] max-w-[465px] bg-white shadow-sm">

                        {/* Header */}
                        <Heading className="text-slate-800 text-[20px] font-semibold text-center p-0 mt-[24px] mb-[16px] mx-0">
                            Verify your email address
                        </Heading>

                        {/* Greeting */}
                        <Text className="text-slate-600 text-[14px] leading-[24px]">
                            Hi {username},
                        </Text>

                        <Text className="text-slate-600 text-[14px] leading-[24px]">
                            Please use the verification code below to complete your authentication.
                            This code will expire in **10 minutes**.
                        </Text>

                        {/* OTP Code Box */}
                        <Section className="bg-slate-100 rounded-md my-[24px] py-[16px] text-center">
                            <Text className="text-[32px] font-mono font-bold tracking-[6px] text-slate-900 m-0">
                                {otp}
                            </Text>
                        </Section>

                        {/* Security Warning */}
                        <Text className="text-slate-500 text-[12px] leading-[20px]">
                            If you did not request this verification code, please ignore this email or contact support if you have security concerns.
                        </Text>

                        <Hr className="border border-solid border-slate-200 my-[24px] mx-0 w-full" />
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}

export default VerificationEmail;