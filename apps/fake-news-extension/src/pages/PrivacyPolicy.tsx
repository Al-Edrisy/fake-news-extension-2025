'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-foreground">Privacy Policy</CardTitle>
        </CardHeader>
        <Separator />
        <ScrollArea className="h-[600px] px-8 py-6">
          <CardContent className="space-y-6 text-base text-muted-foreground leading-relaxed">
            <p>
              This Privacy Policy explains how VeriNews (“the extension”) collects, uses, and protects data when users interact with our Chrome extension.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">1. Data Collection</h2>
            <p>
              VeriNews does not collect or store any personal information. The extension allows users to verify online claims by sending the selected text or content to our backend service.
            </p>
            <p>We only store the following data:</p>
            <ul className="list-disc list-inside ml-6 space-y-1">
              <li>Text of claims submitted for verification</li>
              <li>Analysis results generated by our fact-checking models</li>
              <li>News sources retrieved during the verification process</li>
            </ul>
            <p>No user accounts, emails, IP addresses, or other identifying information are collected or stored.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">2. Data Usage</h2>
            <p>
              The data stored is solely used to improve our claim classification accuracy and content verification quality. All data is anonymized and aggregated for model retraining and service enhancement.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">3. Third-Party Services</h2>
            <p>
              VeriNews may use third-party APIs for search and fact-checking purposes. We do not share any data with advertisers or unauthorized parties.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">4. Security</h2>
            <p>
              All communication between the extension and our backend service is encrypted using HTTPS. We follow best practices to ensure the security and integrity of our backend and stored data.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">5. User Rights</h2>
            <p>
              Since no personal data is collected or stored, users do not need to take action regarding data privacy requests. You can use the extension without creating an account or providing personal information.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">6. Contact Information</h2>
            <p>
              If you have questions, concerns, or requests related to this Privacy Policy, please contact the developer at{" "}
              <a href="mailto:salehfree33@gmail.com" className="text-blue-600 underline hover:text-blue-800">
                salehfree33@gmail.com
              </a>.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. The latest version will always be available here.
            </p>

            <p className="text-sm text-center text-muted-foreground pt-6">
              &copy; {new Date().getFullYear()} VeriNews. All rights reserved.
            </p>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  )
}
