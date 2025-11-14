import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="text-[#9A9A9A] px-4 sm:px-6 py-8 sm:py-12 lg:py-16 bg-[#F8FBFF] mx-2 my-4 rounded-2xl">
            <div className="container mx-auto max-w-7xl w-full">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start mb-12">
                    <div className="mb-8 md:mb-0 max-w-xs mx-auto lg:mx-0 text-center lg:text-left flex flex-col items-center lg:items-start">
                        <img src="/assets/LogoColumbia.svg" alt="Columbia" className="w-64 h-auto mb-3" />
                        <p className="text-md leading-tight text-[#1E305F] mb-3">
                        La evolución de la radio en Costa Rica. Música, cultura y comunidad que te inspiran.
                        </p>
                        <p className="text-xs text-[#000000]/60"> © Todos los derechos reservados. 2025 Radio Columbia </p >
                    </div>

                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 text-center lg:text-left mx-auto lg:mx-0">
                        <div>
                            <p className="text-xl mb-2 flex items-center justify-center lg:justify-start text-[#1E305F] font-semibold">
                                Información
                            </p>
                            <ul className="space-y-2 text-md text-[#000000]/60">
                                <li><Link href="/about-us" className="hover:text-[#1E305F] transition-colors">Sobre Nosotros</Link></li>
                                <li><Link href="/podcasts" className="hover:text-[#1E305F] transition-colors">Podcasts y Radionovelas</Link></li>
                                <li><Link href="/contact" className="hover:text-[#1E305F] transition-colors">Contacto</Link></li>
                            </ul>
                        </div>

                       <div>
                            <p className="text-xl mb-2 flex items-center justify-center lg:justify-start text-[#1E305F] font-semibold">
                                Redes Sociales
                            </p>
                            <ul className="space-y-2 text-md text-[#000000]/60">
                                <li><a href="https://www.instagram.com/noticiascolumbia/?hl=es" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E305F] transition-colors">Instagram</a></li>
                                <li><a href="https://www.youtube.com/channel/UCo2Fr8GUPmevyi7uih-0oTg/featured?view_as=subscriber" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E305F] transition-colors">YouTube</a></li>
                                <li><a href="https://www.facebook.com/NoticiasColumbia/?locale2=pt_PT&_rdr" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E305F] transition-colors">Facebook</a></li>
                                <li><a href="https://www.facebook.com/ColumbiaDigitalcr/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E305F] transition-colors">Facebook Digital</a></li>
                                <li><a href="https://x.com/webcolumbia?lang=es" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E305F] transition-colors">Twitter (X)</a></li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-xl mb-2 flex items-center justify-center lg:justify-start text-[#1E305F] font-semibold">
                                Contacto
                            </p>
                            <ul className="space-y-2 text-md text-[#000000]">
                                <li className='flex flex-col'>Teléfono: <a href="tel:+50622240707" className="hover:text-[#1E305F] transition-colors text-[#000000]/60">+506 2224 - 0707</a></li>
                                <li className='flex flex-col'>Correo: <a href="mailto:ventas@grupocolumbia.co.cr" className="hover:text-[#1E305F] transition-colors text-[#000000]/50">ventas@grupocolumbia.co.cr</a></li>
                                <li className='flex flex-col'>Pauta con nosotros: <Link href="/contact" className="hover:text-[#1E305F] transition-colors text-[#000000]/50">Formulario</Link></li>
                            </ul>       
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
