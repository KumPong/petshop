import Logo from '../assets/Logo.png'

const FacebookIcon = ({ size = 20, className }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
    );

const InstagramIcon = ({ size = 20, className }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
    );

const TwitterIcon = ({ size = 20, className }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
    );

function Footer () {
    return(
        <footer className='bg-other text-black pt-10 pb-6'>
            <div className='max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8'>
                {/* Brand Section */}
                <div>
                    <div className='flex items-center gap-2 mb-4'>
                        <div className='bg-secondary p-1.5 rounded-full text-black'>
                            <img src={Logo} alt="PetStop" className="h-8 cursor-pointer"/>
                        </div>
                        <h2 className='text-2xl font-bold'>PetStop</h2>
                    </div>
                    <p className='text-sm text-black mb-4'>
                        Your one-stop shop for all your furry friends' needs. We provide the best quality products for your beloved pets.
                    </p>
                    <div className='flex justify-center'>
                        <FacebookIcon className='cursor-pointer hover:text-primary transition' size={20} />
                        <InstagramIcon className='cursor-pointer hover:text-primary transition' size={20} />
                        <TwitterIcon className='cursor-pointer hover:text-primary transition' size={20} />
                    </div>
                </div>

                {/* Quick Link */}
                <div>
                    <h3 className='text-lg font-semibold mb-4 border-b border-primary/30 pb-2 inline-block'>Quick Links</h3>
                    <ul className='space-y-2 text-sm'>
                        <li><a href="/" className='hover:text-primary transition'>Home</a></li>
                        <li><a href="/products" className='hover:text-primary transition'>Shop All</a></li>
                        <li><a className='hover:text-primary transition'>About Us</a></li>
                        <li><a className='hover:text-primary transition'>Contact</a></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className='text-lg font-semibold mb-4 border-b border-primary/30 pb-2 inline-block'>Contact Us</h3>
                    <ul className='space-y-2 text-sm text-gray-600'>
                        <li>123 Pet Street, Animal City, 10110</li>
                        <li>Phone: 0123456789 </li>
                        <li>Email: support@petstop.com</li>
                    </ul>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-primary/30 text-center text-sm text-primary'>
                © {new Date().getFullYear()} PetStop. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;