import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";


export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-top">

                {/* Column 1 */}
                <div>
                    <h3>Recell Bazar</h3>
                    <Link href="/dashboard/about">About us</Link>
                </div>

                {/* Column 2 */}
                <div>
                    <h3>Support</h3>
                    <p>sushimrupakheti120@gmail.com</p>
                    <p>+977-9818569990</p>

                    <div className="social-icons">
                        <Link href="https://www.facebook.com/susim.sushim" aria-label="Facebook">
                            <Facebook size={18} />
                        </Link>

                        <Link href="https://www.instagram.com/susim_sushim/" aria-label="Instagram">
                            <Instagram size={18} />
                        </Link>

                        <Link href="https://www.linkedin.com/in/sushim-rupakheti-16744b2a8/" aria-label="LinkedIn">
                            <Linkedin size={18} />
                        </Link>
                    </div>

                </div>

                {/* Column 3 */}
                <div>
                    <h3>Account</h3>
                    <Link href="/dashboard/profile">My Account</Link>
                    <Link href="/dashboard/cart">Cart</Link>
                    <Link href="/dashboard/sell">Sell</Link>
                    <Link href="/dashboard/home">Shop</Link>
                </div>

                {/* Column 4 */}
                <div>
                    <h3>Payment Accepted</h3>
                    <div className="payment flex items-center gap-2">
                        <img
                            src="/stripe.jpg"
                            alt="stripe"
                            className="w-30 h-auto object-contain"
                        />
                    </div>
                </div>


            </div>

            <div className="footer-bottom">
                <p>© Copyright Recell Bazar. All right reserved</p>
                <p>Designed and Developed by Sushim Rupakheti</p>
            </div>
        </footer>
    );
}
