const testimonials = [
    {
        name: 'Jennifer Adams',
        review: '“Raphael AI 是我用过的最直观的 AI 图像生成器。结果令人惊叹，而且过程非常有趣。”',
    },
    {
        name: 'Michael Anderson',
        review: '“我喜欢 Raphael AI 提供的各种风格。它就像一个无限的创意游乐场。由 FLUX.1 Dev 提供支持的免费版本真是太棒了。”',
    },
    {
        name: 'Emily Carter',
        review: '“作为一个专业艺术家，我对我能如此迅速地创作出高质量的图像感到震惊。Raphael AI 已成为我工作流程中不可或缺的工具。”',
    },
];

const TestimonialsSection = () => {
    return (
        <section className="py-20 bg-gray-900">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold">用户对 Raphael AI 的评价</h2>
                    <p className="text-lg text-gray-400 mt-2">看看我们的用户对我们的 AI 图像创作和专业工具的评价。</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-gray-800 p-6 rounded-lg">
                            <p className="text-gray-400 mb-4">{testimonial.review}</p>
                            <p className="font-bold text-yellow-400">{testimonial.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection; 