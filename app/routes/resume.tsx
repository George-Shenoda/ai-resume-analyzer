import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import React from "react";
import Summary from "~/components/summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => ([
    {title: 'Resumes | Review'},
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const {auth, isLoading, kv, fs} = usePuterStore()
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedbacks] = useState<Feedback | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated){
            navigate(`/ai-resume-analyzer/auth?next=/ai-resume-analyzer/resume/${id}`);
        }
    }, [isLoading]);

    useEffect(() => {

        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);
            if (!resume) return;
            
            const data = JSON.parse(resume);
            const resumeFile = await fs.read(data.resumePath);
            if(!resumeFile) return;
            
            const pdfBlob = new Blob([resumeFile], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageFile = await fs.read(data.imagePath);
            if(!imageFile) return;
            
            const imageBlob = new Blob([imageFile], { type: 'image/png' });
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedbacks(data.feedback);
        }

        loadResume();
    }, [id ]);
    return (
        <main className={`pt-0!`}>
            <nav className={`resume-nav`}>
                <Link to={`/`} className={`back-button `}>
                    <img src={`/icons/back.svg`} alt="Back" className={`w-2.5 h-2.5`} />
                    <span className={`text-gray-800 text-sm font-semibold`}>Back To Homepage</span>
                </Link>
            </nav>
            <div className={`flex flex-row w-full max-lg:flex-col-reverse`}>
                <section className={`feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-screen sticky top-0 items-center justify-center`}>
                    {imageUrl && resumeUrl &&(
                        <div className={` animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-xl::h-fit w-fit`}>
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img src={imageUrl} alt="Resume Preview" className={`w-full h-full object-contain rounded-2xl`} title="resume"/>
                            </a>
                        </div>
                    )}
                </section>
                <section className={`feedback-section`}>
                    <h2 className="text-4xl text-black! font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ): (
                        <img src="/images/resume-scan-2.gif" alt="Loading" className="w-full"/>
                    )}
                </section>
            </div>
        </main>
    )
}

export default Resume;