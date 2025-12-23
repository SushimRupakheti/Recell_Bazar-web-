import Image from "next/image";
import Link from "next/link";
import RegisterForm from "../_components/register_form";

export default function RegisterPage() {
  return (
    <div className="auth-page">
      {/* Left Side */}
      <div className="auth-left">
        <Image
          src="/auth_bg.png"
          alt="App Preview"
          width={500}
          height={500}
          priority
        />
      </div>

      {/* Right Side */}
      <div className="auth-right">
        <RegisterForm />

        <p className="auth-footer">
          Already have an account?{" "}
          <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
