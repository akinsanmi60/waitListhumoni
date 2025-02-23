import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  ArrowRight,
  Star,
  CreditCard,
  Home as HomeIcon,
  Briefcase,
  Mail,
  Check,
  X,
} from "lucide-react";
import { SiLinkedin } from "react-icons/si";

import { insertWaitlistSchema, type InsertWaitlist } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { WaitlistPosition } from "@/components/WaitlistPosition";
import { CustomCursor } from "@/components/CustomCursor";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ContactDrawer } from "@/components/ContactForm";

const LogoWhite = "/assets/png/logo-white.png";
const EmpathyIcon = "/assets/svg/empathy.svg";
const EmpowerIcon = "/assets/svg/empower.svg";
const EquityIcon = "/assets/svg/equity.svg";

// Enhanced animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.8
    }
  }
};

// Only modifying the Values section animations
const valueVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  }
};

export default function HomePage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertWaitlist>({
    resolver: zodResolver(insertWaitlistSchema),
    defaultValues: {
      name: "",
      email: "",
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertWaitlist) => {
      const response = await apiRequest("POST", "/api/waitlist", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to join waitlist");
      }
      return response.json();
    },
    onSuccess: (response, variables) => {
      setSubmittedEmail(variables.email);
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      toast({
        title: "Thank you for joining! 🎉",
        description: "You're now on our waitlist. We'll keep you updated on our progress.",
      });
    },
    onError: (error: Error) => {
      const message = error.message.includes("409")
        ? "This email is already registered for the waitlist"
        : "Something went wrong. Please try again.";

      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    },
  });

  const onSubmit = async (data: InsertWaitlist) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      // Error is handled in mutation.onError
    }
  };

  useEffect(() => {
    return () => {
      setSubmitted(false);
      setSubmittedEmail("");
    };
  }, []);

  return (
    <div className="min-h-screen font-inter">
      <CustomCursor />
      <motion.nav
        className="sticky top-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-white/10 shadow-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.img
              src={LogoWhite}
              alt="Humoni"
              className="h-8 w-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            />
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white text-xl font-semibold tracking-tight hidden sm:inline-block"
            >
              Humoni
            </motion.span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>
            <ContactDrawer />
          </div>
        </div>
      </motion.nav>

      <main className="relative">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="relative bg-primary/90 pt-32 pb-36"
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)"
            }}
          />
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                variants={sectionVariants}
                className="text-left max-w-2xl mx-auto lg:mx-0 lg:pr-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-6"
                >
                  <Badge
                    variant="secondary"
                    className="relative bg-white/90 text-primary px-4 py-1.5 text-sm font-medium shadow-md"
                  >
                    <Star className="w-4 h-4 mr-2 text-primary inline-block" />
                    Early Access
                  </Badge>
                </motion.div>

                <motion.h1
                  className="text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] text-white mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {heroContent.title}
                  <br />
                  <span className="text-white/90">{heroContent.subtitle}</span>
                </motion.h1>

                <motion.p
                  className="text-xl text-white/80 max-w-xl mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  {heroContent.description}
                </motion.p>
              </motion.div>

              <motion.div
                variants={sectionVariants}
                id="waitlist-form"
                className="lg:ml-auto w-full max-w-md mx-auto"
              >
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="bg-gradient-to-br from-white to-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 border-primary/20 backdrop-blur-sm hover:shadow-[0_25px_60px_rgba(0,0,0,0.2)] transition-shadow duration-300 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg" />
                        <CardContent className="pt-4 relative">
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                              <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700">Full Name</FormLabel>
                                    <div className="relative">
                                      <FormControl>
                                        <Input
                                          {...field}
                                          className="h-11 pl-4 pr-10 bg-white/90 border-gray-200 shadow-sm transition-all duration-300 hover:border-primary focus:border-primary hover:scale-[1.01] focus:scale-[1.02]"
                                          placeholder="Enter your name"
                                          aria-label="Full name"
                                        />
                                      </FormControl>
                                      <AnimatePresence>
                                        {form.formState.dirtyFields.name && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute right-3 top-2.5"
                                          >
                                            {form.formState.errors.name ? (
                                              <X className="h-5 w-5 text-destructive" />
                                            ) : (
                                              <Check className="h-5 w-5 text-green-500" />
                                            )}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700">Email</FormLabel>
                                    <div className="relative">
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="email"
                                          className="h-11 pl-4 pr-10 bg-white/90 border-gray-200 shadow-sm transition-all duration-300 hover:border-primary focus:border-primary hover:scale-[1.01] focus:scale-[1.02]"
                                          placeholder="Enter your email"
                                          aria-label="Email address"
                                        />
                                      </FormControl>
                                      <AnimatePresence>
                                        {form.formState.dirtyFields.email && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute right-3 top-2.5"
                                          >
                                            {form.formState.errors.email ? (
                                              <X className="h-5 w-5 text-destructive" />
                                            ) : (
                                              <Check className="h-5 w-5 text-green-500" />
                                            )}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="pt-2"
                              >
                                <Button
                                  type="submit"
                                  size="lg"
                                  className="w-full bg-primary hover:bg-primary/90 text-white h-11 transform transition-all duration-300 relative overflow-hidden group"
                                  disabled={mutation.isPending}
                                >
                                  <span className="relative z-10 flex items-center justify-center">
                                    {mutation.isPending ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        Join the Waitlist
                                        <motion.div
                                          className="ml-2"
                                          animate={{ x: [0, 5, 0] }}
                                          transition={{ duration: 1, repeat: Infinity }}
                                        >
                                          <ArrowRight className="w-4 h-4" />
                                        </motion.div>
                                      </>
                                    )}
                                  </span>
                                </Button>
                              </motion.div>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        delay: 0.2
                      }}
                    >
                      {submittedEmail && <WaitlistPosition email={submittedEmail} />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        </motion.section>
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          className="relative py-16 md:py-24 bg-gradient-to-b from-background to-primary/5"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
            <motion.div
              className="text-center mb-12 max-w-3xl mx-auto"
              variants={cardVariants}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">How We Help</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We connect migrants with essential services to help them thrive in their new country.
              </p>
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="grid gap-8 md:gap-12 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
            >
              {[
                {
                  icon: CreditCard,
                  iconBg: "bg-gradient-to-br from-primary/90 to-primary/70",
                  iconColor: "text-white",
                  title: "Connect with Credit Services",
                  description: "Access financial institutions that understand international backgrounds through our marketplace.",
                  benefits: ["Alternative assessment methods", "Multiple service options", "Clear process"]
                },
                {
                  icon: HomeIcon,
                  iconBg: "bg-gradient-to-br from-primary/80 to-primary/60",
                  iconColor: "text-white",
                  title: "Housing Connections",
                  description: "Find housing opportunities through our network of international-friendly providers.",
                  benefits: ["Property listings", "Application guidance", "Documentation support"]
                },
                {
                  icon: Briefcase,
                  iconBg: "bg-gradient-to-br from-primary/70 to-primary/50",
                  iconColor: "text-white",
                  title: "Career Opportunities",
                  description: "Connect with employers seeking international talent and experience.",
                  benefits: ["Job connections", "Skills matching", "Career resources"]
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/10 text-center"
                >
                  <div className="flex flex-col items-center">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className={`w-16 h-16 ${feature.iconBg} rounded-2xl p-3.5 mb-6 shadow-lg flex items-center justify-center`}
                    >
                      <feature.icon className={`w-full h-full ${feature.iconColor} transition-transform duration-300`} />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-gray-600 mb-6 text-sm max-w-sm mx-auto">{feature.description}</p>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: i * 0.15,
                            duration: 0.5,
                            ease: "easeOut"
                          }}
                          className="flex items-center justify-center text-sm text-gray-600"
                        >
                          <ArrowRight className={`w-4 h-4 mr-2 text-primary transition-colors duration-300`} />
                          {benefit}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
        <div className="bg-background py-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Button
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg transform transition-all duration-300 relative overflow-hidden group shadow-lg hover:shadow-xl"
              onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join Our Waitlist
              <motion.div
                className="ml-2 inline-block"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Button>
          </motion.div>
        </div>
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          className="relative py-16 md:py-24 bg-gradient-to-b from-background to-primary/5"
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-4">Our Values</Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Join Our Vision</h2>
              <p className="text-lg text-gray-600 mb-8">
                Be part of a platform that's making financial services accessible to everyone.
              </p>
            </div>
            <motion.div
              variants={cardVariants}
              className="grid gap-8 md:gap-12 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
            >
              {[
                {
                  icon: EmpathyIcon,
                  title: "Empathy",
                  description: "We deeply understand the migrant journey because it's our story too. Every service we build starts with listening to our community's needs.",
                  gradient: "from-primary/90 to-primary/70"
                },
                {
                  icon: EmpowerIcon,
                  title: "Empowerment",
                  description: "We give migrants the tools and connections they need to thrive, not just survive. Your success is our mission.",
                  gradient: "from-primary/80 to-primary/60"
                },
                {
                  icon: EquityIcon,
                  title: "Equity",
                  description: "We're breaking down systemic barriers to create fair access to financial services for every migrant, regardless of their background.",
                  gradient: "from-primary/70 to-primary/50"
                }
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  variants={valueVariants}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300, damping: 25 }
                  }}
                  className="relative p-8 bg-gradient-to-br from-white to-primary/5 rounded-xl shadow-md hover:shadow-lg transition-all duration-500 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex flex-col items-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className={`inline-block p-4 rounded-2xl bg-gradient-to-br ${value.gradient} mb-6 shadow-lg`}
                    >
                      <img
                        src={value.icon}
                        alt={value.title}
                        className="w-16 h-16 text-white"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                    <p className="text-gray-600 max-w-sm mx-auto text-sm">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="mt-12 text-center"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="bg-primary hover:bg-primary/90 text-white px-8 h-11 transform transition-all duration-300 relative overflow-hidden group shadow-lg hover:shadow-xl"
                  onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Join Our Movement
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <footer className="bg-primary text-white py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <div>
                <img src={LogoWhite} alt="Humoni" className="h-8 mb-4" />
                <p className="text-sm text-white/80">
                  Humoni Ltd - Connecting migrants with essential services in their new home.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/faq" className="text-white/80 hover:text-white">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="/privacy" className="text-white/80 hover:text-white">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-white/80 hover:text-white">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Connect With Us</h3>
                <div className="space-y-4">
                  <ContactDrawer />
                  <a
                    href="https://www.linkedin.com/company/humoni"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white flex items-center"
                  >
                    <SiLinkedin className="w-4 h-4 mr-2" />
                    Follow us on LinkedIn
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/60">
              © {new Date().getFullYear()} Humoni Ltd. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

const heroContent = {
  title: "Join Our Global Movement:",
  subtitle: "Transforming Migrant Lives Worldwide",
  description: "We're building a powerful community of migrants, creating pathways to financial freedom and social mobility. Be among the first to access our platform."
};