import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'

const Rating = ({ rating, onRate }) => {
    const [initRating, setInitRating] = useState(rating || 0)

    useEffect(() => {
        if (rating) {
            setInitRating(rating)
        }
    }, [rating])

    const handleRate = (value) => {
          setInitRating(value)
        if (onRate) {
          
            onRate(value)
        }
    }

    return (
        <div className='flex items-center gap-1.5'>
            {Array.from({ length: 5 }, (_, index) => {
                const starValue = index + 1
                return (
                    <span key={index} className={`text-xl sm:text-2xl cursor-pointer transition-colors ${starValue <= initRating ? 'text-yellow-400': 'text-gray-300'}`}
                    onClick={()=>handleRate(starValue)}>
                        &#9733;
                    </span>
                )
            })}
        </div>
    )
}

export default Rating