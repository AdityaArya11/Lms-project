import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'

const Rating = ({ rating, onRate }) => {
    const [initRating, setInitRating] = useState(0)

    useEffect(() => {
        if (rating) {
            setInitRating(rating)
        }
    }, [rating])

    const handleRate = (value) => {
        if (onRate) {
            setInitRating(value)
            onRate(value)
        }
    }

    return (
        <div className='flex items-center gap-1.5'>
            {Array.from({ length: 5 }, (_, index) => {
                const starValue = index + 1
                return (
                    <img
                        key={index}
                        src={starValue <= initRating ? assets.star : assets.star_blank}
                        alt="star"
                        className={`w-3.5 h-3.5 ${onRate ? 'cursor-pointer hover:scale-110 transition-transform duration-100' : ''}`}
                        onClick={() => handleRate(starValue)}
                    />
                )
            })}
        </div>
    )
}

export default Rating