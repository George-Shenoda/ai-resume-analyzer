import Navbar from "~/components/navbar";
import {type FormEvent, useState} from "react";
import FileUploader from "~/components/FileUploader";
import DOMPurify  from 'dompurify'
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2image";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";
import {zodResume} from "../../types/zodIndex.d";
import React from "react";

export  default function Upload(){
    const { fs, ai, kv } = usePuterStore()
    const  navigate = useNavigate()
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file } : {companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
        setIsProcessing(true);
        setStatusText("Uploading the File...");
        const uploadedFile = await fs.upload([file])
        if (!uploadedFile) return setStatusText("Error: failed to upload file");
        setStatusText("converting to image...");

        const image = await convertPdfToImage(file);
        if (!image.file) return setStatusText("Error: failed to convert image");

        setStatusText("Uploading image...");
        const uploadedImage = await fs.upload([image.file])

        if (!uploadedImage) return setStatusText("Error: failed to upload image");
        setStatusText("preparing data...");

        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName: companyName,
            jobTitle: jobTitle,
            jobDescription: jobDescription,
            feedback: ''
        }

        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText("Analyzing data...");
        const feedback = await ai.feedback(uploadedFile.path, prepareInstructions({
            jobTitle, jobDescription
        }))


        if (!feedback) return setStatusText("Error: failed to analyze file");

        const feedbackText = typeof feedback.message.content === "string" ? feedback.message.content : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);

        const result = zodResume.safeParse(data);
        if (!result.data) return setStatusText(`${result.error}`);

        await kv.set(`resume:${uuid}`, JSON.stringify(result.data));
        setStatusText("Analysis complete., redirecting...");
        console.log(result.data)
        navigate(`/resume/${uuid}`)
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);
        const companyName = DOMPurify.sanitize(formData.get('company-name') as string);
        const jobTitle = DOMPurify.sanitize(formData.get('job-title') as string);
        const jobDescription = DOMPurify.sanitize(formData.get('job-description') as string);

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file })

    }

    return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />
        <section className="main-section">
            <div className="page-heading py-16">
                <h1>Smart feedback for your dream job</h1>
                {isProcessing ? (
                    <>
                        <h2>{statusText}</h2>
                        <img src={`/images/resume-scan.gif`} alt="" className={`w-full`}/>
                    </>
                ): (
                    <>
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                        <form onSubmit={handleSubmit} id={`upload-form`} className={"flex flex-col gap-4 mt-8"}>
                            <div className="form-div">
                                <label htmlFor={`company-name`}>Company Name</label>
                                <input type="text" name={`company-name`} placeholder={`Company Name`} id={`company-name`}/>
                            </div>
                            <div className="form-div">
                                <label htmlFor={`job-title`}>Job Title</label>
                                <input type="text" name={`job-title`} placeholder={`Job Title`} id={`job-title`}/>
                            </div>
                            <div className="form-div">
                                <label htmlFor={`job-description`}>Job Description</label>
                                <textarea rows={5} name={`job-description`} placeholder={`Job Description`} id={`job-description`}/>
                            </div>
                            <div className="form-div">
                                <label htmlFor={`uploader`}>Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>
                            <button type="submit" className={`primary-button`}>Analyze Resume</button>
                        </form>
                    </>
                )}
            </div>
        </section>
    </main>
}