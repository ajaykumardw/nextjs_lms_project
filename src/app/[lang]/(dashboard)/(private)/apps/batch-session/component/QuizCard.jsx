const QuizCard = ({ title, onClick, badge }) => {
    return (
        <div
            className="relative bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition cursor-pointer w-64 text-center"
            onClick={onClick}
        >
            {badge && (
                <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}

            {title === 'Import from Spreadsheet' && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="green" viewBox="0 0 24 24" width="40" height="40">
                    <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#34a853" />
                    <path d="M14 2v6h6" fill="#2c7" />
                    <path fill="#fff" d="M8 10h8v2H8zm0 3h8v2H8z" />
                </svg>
            )}

            {title === 'Create Manually' && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="dodgerblue" strokeWidth="2" viewBox="0 0 24 24" width="40" height="40">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
            )}

            <p className="text-sm font-semibold text-gray-800">{title}</p>
        </div>
    );
};

export default QuizCard;
