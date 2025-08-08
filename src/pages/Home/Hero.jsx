import React from 'react'
import { CiStar } from 'react-icons/ci'
import { FaArrowRight } from 'react-icons/fa'
import { FiShoppingBag } from 'react-icons/fi'

const Hero = () => {
    return (
        <div className='bg-gray-200 w-full min-h-[90vh] flex justfify-between items-center'>
            <div className='w-[50%] mx-auto flex justify-center px-20 flex-col p-8 '>
                <div className='w-fit flex mb-4 bg-white p-4 rounded-full gap-2'>
                    🚀
                    <p className='text-gray-600 text-lg font-medium'>
                        Terpercaya oleh 1000+ Mahasiswa
                    </p>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Semua Kebutuhan
                    <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        IoT & Elektronik
                    </span>
                    <span className="block text-4xl lg:text-5xl">
                        untuk Mahasiswa
                    </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-xl my-5">
                    Dari Arduino hingga Raspberry Pi, dapatkan semua komponen untuk project kuliah, tugas akhir, dan eksperimen teknologi Anda dengan harga mahasiswa!
                </p>
                <button className="w-fit group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                    <FiShoppingBag className="w-5 h-5 mr-2" />
                    Mulai Belanja
                    <FaArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>

            </div>
            <div className='w-[50%]'>kanan</div>
        </div>
    )
}

export default Hero