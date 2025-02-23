import { motion } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ContactDrawer } from "@/components/ContactForm";

const faqVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function FAQPage() {
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const headerBlur = useTransform(scrollYProgress, [0, 0.2], [0, 8]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <motion.nav
        style={{
          opacity: headerOpacity,
          backdropFilter: `blur(${headerBlur}px)`
        }}
        className="sticky top-0 z-50 bg-primary/95"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-white font-semibold text-lg">Humoni</a>
          <ContactDrawer />
        </div>
      </motion.nav>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={faqVariants}
          className="max-w-3xl mx-auto space-y-8"
        >
          <div className="text-center space-y-4 mb-12">
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find answers to common questions about Humoni and how we're building financial access for migrants
            </p>
          </div>

          <div className="grid gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl shadow-sm border border-primary/10 overflow-hidden"
              >
                <Accordion type="single" collapsible>
                  <AccordionItem value={faq.id} className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/5">
                      <span className="text-lg font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 pt-2 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <ContactDrawer />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

const faqs = [
  {
    id: "what-is-humoni",
    question: "What is Humoni?",
    answer: "Humoni is a platform designed to empower migrants by helping them access essential financial services, including credit-building tools, housing solutions, job opportunities, and financial education."
  },
  {
    id: "is-humoni-bank",
    question: "Is Humoni a bank or a lender?",
    answer: "No, Humoni is not a lender or a bank. Instead, we connect migrants to trusted financial institutions that offer fair credit and essential services based on real-time financial data and alternative credit assessments."
  },
  {
    id: "how-works",
    question: "How does Humoni work?",
    answer: "Our platform will use open banking data and alternative data to assess users' financial profiles and match them with services such as housing, job opportunities, and financial products."
  },
  {
    id: "credit-history",
    question: "I don't have a credit history in the UK. Can I still use Humoni?",
    answer: "Yes! Many migrants face this challenge, and that's exactly why we're building Humoni. Our goal is to help you build credit and access financial opportunities from day one."
  },
  {
    id: "waitlist-benefits",
    question: "What do I get by joining the waitlist?",
    answer: "Early access, exclusive updates, and a chance to help shape the platform before launch. You'll also be the first to access partnership deals and early-bird offers!"
  },
  {
    id: "expansion-plans",
    question: "Will Humoni expand beyond the UK?",
    answer: "Yes! Our vision is to serve migrants in high-adoption countries like Canada and Australia. As we grow, we'll expand to new markets."
  }
];