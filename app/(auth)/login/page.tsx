import Image from "next/image";
import Link from "next/link";
import LoginForm from "../_components/login_form"; 
import AuthHeader from "@/app/components/auth_header";

export default function LoginPage() {
  return (
    <>
    <AuthHeader></AuthHeader>
    <div className="auth-page">
      <div className="auth-left">
        <Image
          src="/auth_bg.png"
          alt="App Preview"
          width={500}
          height={500}
          priority
        />
      </div>

      <div className="auth-right">
        <LoginForm />

        <p className="auth-footer">
          Didn’t have an account?{" "}
          <Link href="/register">Sign Up</Link>
        </p>
      </div>
    </div>
    </>
  );
}
