import React from 'react';

const ContactForm = () => {
  return (
    <section className="flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 lg:py-16 bg-[#F8FBFF] mx-2 my-4 rounded-2xl">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-start justify-between">
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-0">
          <h2 className="text-5xl sm:text-7xl font-semibold text-[#1E305C] leading-none mb-2">
            Ponte<br />en contacto<br />con <span className="text-[#D51F2F]">nosotros</span>
          </h2>
          <div className="w-2/3 h-0.5 bg-[#D4D5DD] my-4" />
          <p className="text-[#2F3037]/60 text-lg mb-6 max-w-lg">
            Puede comunicarse con nosotros por los diferentes medios disponibles. También puedes llenar el formulario y pronto un asesor se comunicará con tu petición.
          </p>
          <div className="flex flex-col lg:flex-row gap-4 w-full items-center lg:items-start">
          <div className="text-center lg:text-left">
              <p className="font-semibold text-[#2F3037] mb-1">Centro de llamadas</p>
              <p className="text-[#2F3037]/60 text-md">Comunícate en el horario de<br />
                <a href="tel:+50622240707" className="text-[#01A299] hover:underline">
                  (506+) 2224 - 0707
                </a>
              </p>
            </div>
            <div className="text-center lg:text-left">
              <p className="font-semibold text-[#2F3037] mb-1">Correo electrónico</p>
              <p className="text-[#2F3037]/60 text-md">Puedes escribirnos al correo especializado:<br />
                <a href="mailto:ventas@grupocolumbia.co.cr" className="text-[#01A299] hover:underline">
                  ventas@grupocolumbia.co.cr
                </a>
              </p>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <script src="https://static.elfsight.com/platform/platform.js" async></script>
          <div className="elfsight-app-ff235366-3fdb-41e1-9398-19a6f298bb11" data-elfsight-app-lazy></div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm; 