import Image from 'next/image';

const images = [
    '/gallery/1.jpg',
    '/gallery/2.jpg',
    '/gallery/3.jpg',
    '/gallery/4.jpg',
    '/gallery/5.jpg',
    '/gallery/6.jpg',
    '/gallery/7.jpg',
    '/gallery/8.jpg',
    '/gallery/9.jpg',
    '/gallery/10.jpg',
    '/gallery/11.jpg',
    '/gallery/12.jpg',
];

const InspirationSection = () => {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold">获取灵感</h2>
                    <p className="text-lg text-gray-400 mt-2">从我们社区创作的最新图像中汲取灵感。</p>
                </div>
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                    {images.map((src, index) => (
                        <Image key={index} src={src} alt={`Inspiration image ${index + 1}`} width={500} height={500} className="w-full h-auto mb-4 rounded-lg" />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InspirationSection; 