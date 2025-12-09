import Navbar from "~/components/navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import React from "react";

export function meta() {
    return [
        { title: "Resumes" },
        { name: "description", content: "Smart feedback for your dream jop!" },
    ];
}

export default function Home() {
    const { auth, kv } = usePuterStore();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadResumes = async () => {
            setLoading(true);
            const storedResumes = (await kv.list("resume:*", true)) as KVItem[];
            const parsedResumes = storedResumes.map(
                (item) => JSON.parse(item.value) as Resume,
            );
            setResumes(parsedResumes || []);
            setLoading(false);
        };

        loadResumes();
    }, []);

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate("/ai-resume-analyzer/auth?next=/ai-resume-analyzer/");
        }
    }, [auth.isAuthenticated]);

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Track Your Applications & Resume Ratings</h1>
                    {!loading && resumes.length === 0 ? (
                        <>
                            <h2>
                                No Resumes Found. Upload your first resume to
                                get Feedback!
                            </h2>
                            <div className="flex flex-col items-center justify-center mt-10 gap-4">
                                <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
                                    Upload Resume
                                </Link>
                            </div>
                        </>
                    ) : (
                        <h2>
                            Review your submissions and check AI-powered
                            feedback.
                        </h2>
                    )}
                </div>
                {loading && (
                    <div className="flex flex-col items-center justify-center">
                        <img
                            src="images/resume-scan-2.gif"
                            alt=""
                            className="w-[200px]"
                        />
                    </div>
                )}
                {!loading && resumes.length > 0 && (
                    <div className="resumes-section">
                        {resumes.map((resume) => (
                            <ResumeCard key={resume.id} resume={resume} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
