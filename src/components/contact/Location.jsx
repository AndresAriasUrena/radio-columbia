import React from 'react';

const Location = () => {
  return (
    <section className="flex flex-col items-center justify-start px-4 sm:px-6 py-8 sm:py-12 lg:py-16 bg-[#F8FBFF] mx-2 my-4 rounded-2xl">
      <div className="w-full max-w-7xl mx-auto flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
          <p className="text-4xl font-semibold leading-tight text-[#1E305C]">
            Nuestra dirección:
          </p>
          <div className="w-full h-0.5 bg-[#D4D5DD] my-5" />
        </div>
        <div className="flex h-[400px] rounded-xl overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d982.3744444444445!2d-84.06158667!3d9.9253417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0e377d76b86bb%3A0xa072c3f90a5bb576!2sRadio%20Columbia!5e0!3m2!1ses!2scr!4v1691234567890!5m2!1ses!2scr"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
};

export default Location;

