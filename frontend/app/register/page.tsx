"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { register as registerApi, sendVerificationCode } from "@/lib/api";
import {
  RegisterFormValues,
  registerSchema,
} from "@/lib/validation";

function getPasswordStrength(password: string): {
  level: number;
  label: string;
} {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) {
    return { level: 0, label: "Enter a strong password" };
  }

  if (score <= 2) {
    return { level: score, label: "Weak password" };
  }

  if (score === 3 || score === 4) {
    return { level: score, label: "Medium strength password" };
  }

  return { level: score, label: "Strong password" };
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [codeStatus, setCodeStatus] = React.useState<string | null>(null);
  const [codeLoading, setCodeLoading] = React.useState(false);
  const [codeCountdown, setCodeCountdown] = React.useState(0);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      code: "",
    },
  });

  const password = form.watch("password", "");
  const passwordStrength = React.useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  React.useEffect(() => {
    if (!codeCountdown) return;

    const timer = window.setInterval(() => {
      setCodeCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [codeCountdown]);

  const handleSendCode = async () => {
    const email = form.getValues("email");

    if (!email) {
      setCodeStatus("Please enter your email address first");
      form.trigger("email");
      return;
    }

    setCodeStatus(null);
    setCodeLoading(true);

    try {
      await sendVerificationCode({ email });
      setCodeStatus("Verification code sent. Please check your inbox.");
      setCodeCountdown(60);
    } catch (error: any) {
      if (error?.name === "ApiError" && typeof error.message === "string") {
        setCodeStatus(error.message);
      } else {
        setCodeStatus(
          "Failed to send verification code. Please try again in a moment."
        );
      }
    } finally {
      setCodeLoading(false);
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    setSuccessMessage(null);

    try {
      const { username, email, password, code } = values;
      const { token, user } = await registerApi({
        username,
        email,
        password,
        code,
      });

      login({ token, user });
      setSuccessMessage("Registration successful, redirecting...");
      router.push("/dashboard");
    } catch (error: any) {
      if (error?.name === "ApiError" && typeof error.message === "string") {
        setFormError(error.message);
      } else {
        setFormError(
          "Registration failed. Please check your details and try again."
        );
      }
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join Nano Banana AI Platform</p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {formError}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm">
                {successMessage}
              </div>
            )}

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe"
                      className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <p className="mt-1 text-xs text-gray-400">
                    {passwordStrength.label}
                  </p>
                  <div className="mt-1 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500 transition-all duration-300"
                      style={{
                        width: `${(passwordStrength.level / 5) * 100}%`,
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">
                    Verification Code
                  </FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input
                        placeholder="123456"
                        className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={codeLoading || codeCountdown > 0}
                      onClick={handleSendCode}
                      className="whitespace-nowrap"
                    >
                      {codeCountdown > 0
                        ? `Resend in ${codeCountdown}s`
                        : codeLoading
                        ? "Sending..."
                        : "Send Code"}
                    </Button>
                  </div>
                  {codeStatus && (
                    <p className="mt-1 text-xs text-gray-400">{codeStatus}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 font-medium transition"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
