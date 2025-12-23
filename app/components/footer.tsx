import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";


export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-top">

                {/* Column 1 */}
                <div>
                    <h3>Recell Bazar</h3>
                    <Link href="#">About us</Link>
                </div>

                {/* Column 2 */}
                <div>
                    <h3>Support</h3>
                    <p>sushimrupakheti120@gmail.com</p>
                    <p>+977-9818569990</p>

                    <div className="social-icons">
                        <Link href="#" aria-label="Facebook">
                            <Facebook size={18} />
                        </Link>

                        <Link href="#" aria-label="Instagram">
                            <Instagram size={18} />
                        </Link>

                        <Link href="#" aria-label="LinkedIn">
                            <Linkedin size={18} />
                        </Link>
                    </div>

                </div>

                {/* Column 3 */}
                <div>
                    <h3>Account</h3>
                    <Link href="#">My Account</Link>
                    <Link href="#">Cart</Link>
                    <Link href="#">Sell</Link>
                    <Link href="#">Shop</Link>
                </div>

                {/* Column 4 */}
                <div>
                    <h3>Payment Accepted</h3>
                    <div className="payment">
                        <span>eSewa</span>
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
