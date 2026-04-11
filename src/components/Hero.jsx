import React from 'react';

const Hero = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-6">
      <div className="rounded-xl overflow-hidden shadow-sm bg-gray-100 aspect-[16/9] min-h-[280px]">
        <img
          src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&q=80"
          alt="Interior con espejo y decoración"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
};

export default Hero;
