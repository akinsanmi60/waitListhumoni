import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const privacyPolicy = {
  title: "Privacy Policy",
  content: `Last updated: ${new Date().toLocaleDateString()}

Humoni Ltd ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

Information We Collect
We collect information that you provide directly to us, including:
- Name and email address when you join our waitlist
- Information you provide through our contact forms
- Any other information you choose to provide

How We Use Your Information
We use the information we collect to:
- Provide, maintain, and improve our services
- Send you technical notices and support messages
- Communicate with you about products, services, and events
- Respond to your comments and questions

Data Security
We implement appropriate technical and organizational measures to maintain the security of your personal information.

Your Rights
You have the right to:
- Access your personal information
- Correct inaccurate information
- Request deletion of your information
- Object to our processing of your information

Contact Us
For questions about this Privacy Policy, please contact us at support@humoni.com`
};

const termsOfService = {
  title: "Terms of Service",
  content: `Last updated: ${new Date().toLocaleDateString()}

Please read these Terms of Service carefully before using our website.

Agreement to Terms
By accessing our website, you agree to be bound by these Terms of Service.

Use License
Permission is granted to temporarily access the materials on Humoni's website for personal, non-commercial use only.

Disclaimer
The materials on Humoni's website are provided on an 'as is' basis. Humoni makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

Limitations
In no event shall Humoni or its suppliers be liable for any damages arising out of the use or inability to use the materials on Humoni's website.

Governing Law
These terms and conditions are governed by and construed in accordance with the laws of the United Kingdom and you irrevocably submit to the exclusive jurisdiction of the courts in that location.`
};

const cookiePolicy = {
  title: "Cookie Policy",
  content: `Last updated: ${new Date().toLocaleDateString()}

This Cookie Policy explains how Humoni Ltd uses cookies and similar technologies to recognize you when you visit our website.

What are cookies?
Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.

How we use cookies
We use cookies for the following purposes:
- Essential cookies: Required for the operation of our website
- Analytical cookies: To analyze how visitors use our website
- Functionality cookies: To remember choices you make and provide enhanced features

Your choices regarding cookies
If you prefer to avoid the use of cookies on our website, you can turn off cookies in your browser settings. Please note that if you disable cookies, some functionality of our website may not be available.`
};

export default function LegalPage() {
  const [location] = useLocation();
  const path = location.split("/")[1];
  
  let content;
  switch(path) {
    case "privacy":
      content = privacyPolicy;
      break;
    case "terms":
      content = termsOfService;
      break;
    case "cookies":
      content = cookiePolicy;
      break;
    default:
      content = { title: "Not Found", content: "Page not found" };
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-primary text-white">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-white/90"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{content.title}</h1>
          <div className="prose prose-slate max-w-none">
            {content.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
