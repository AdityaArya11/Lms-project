import React from 'react'
import { assets, dummyTestimonial } from '../../assets/assets'

const TestimonialsSection = () => {
  return (
    <div className='w-full bg-slate-50/70 py-20 border-b border-slate-200/60'>
      <div className='px-6 md:px-24 max-w-7xl mx-auto flex flex-col items-center text-center'>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-3 border border-amber-200">
          ⭐ Student Testimonials
        </div>
        <h2 className='text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight'>Loved by Thousands of Learners</h2>
        <p className='text-sm md:text-base text-slate-600 mt-3 max-w-2xl leading-relaxed'>Hear from real students who transformed their careers and mastered new technologies using our platform.</p>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full text-left'>
          {dummyTestimonial.map((testimonial, index) => (
            <div key={index} className='border border-slate-200/80 rounded-2xl bg-white shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group'>
              <div className='p-6'>
                <div className='flex items-center gap-4 mb-4'>
                  <img className='h-12 w-12 rounded-full ring-2 ring-indigo-100 object-cover' src={testimonial.image} alt={testimonial.name} />
                  <div>
                    <h3 className='text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors'>{testimonial.name}</h3>
                    <p className='text-xs text-slate-500 font-medium'>{testimonial.role}</p>
                  </div>
                </div>
                <div className='flex gap-1 mb-3'>
                  {[...Array(5)].map((_, i) => (
                    <img className='h-4' key={i} src={i < Math.floor(testimonial.rating) ? assets.star : assets.star_blank} alt="star" />
                  ))}
                </div>
                <p className='text-slate-600 text-sm leading-relaxed italic'>"{testimonial.feedback}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestimonialsSection