'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-foreground">Terms of Service</CardTitle>
        </CardHeader>
        <Separator />
        <ScrollArea className="h-[600px] px-8 py-6">
          <CardContent className="space-y-6 text-base text-muted-foreground leading-relaxed">
            <p>
              These Terms of Service govern your use of VeriNews, a browser extension designed to assist with fact-checking and misinformation detection.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">1. Acceptance</h2>
            <p>
              By installing and using VeriNews, you agree to these terms. If you do not agree, please do not use the extension.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">2. Functionality</h2>
            <p>
              VeriNews enables users to submit textual content for verification against multiple sources. The extension sends the data to a backend service for analysis.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">3. No Account Required</h2>
            <p>
              Users do not need to register or log in. No personal information is stored or required for extension use.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">4. Intellectual Property</h2>
            <p>
              All content and code used within VeriNews are property of the developer unless otherwise noted. Users may not reverse-engineer or distribute the extension.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">5. Limitation of Liability</h2>
            <p>
              VeriNews provides AI-based analysis and should be used for informational purposes only. The developer is not liable for actions taken based on analysis results.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">6. Updates</h2>
            <p>
              We may update these terms at any time. Continued use of the extension implies acceptance of the updated terms.
            </p>

            <h2 className="text-xl font-semibold text-foreground pt-4">7. Contact</h2>
            <p>
              Developer contact:{" "}
              <a href="mailto:salehfree33@gmail.com" className="text-blue-600 underline hover:text-blue-800">
                salehfree33@gmail.com
              </a>
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
