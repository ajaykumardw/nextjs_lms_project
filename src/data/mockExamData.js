const mockExamData = {
    batch: {
        id: 1,
        batch_name: "React Batch 2026",
        login_restrict: 3,
        assessment_start_datetime: new Date("2026-06-29T09:00:00"),
        assessment_end_datetime: new Date("2026-12-31T11:59:59"),

        theory_exam_set: {
            id: 101,
            set_name: "React Final Assessment",
            exam_duration: 60,
            total_questions: 50,
            instruction: `
        <h3>Instructions</h3>
        <ol>
          <li>Read all questions carefully.</li>
          <li>No negative marking.</li>
          <li>Submit before the timer ends.</li>
        </ol>
      `
        }
    },

    student_exam_set_results: {
        id: 1,
        student_id: 1001,
        exam_set_id: 101,
        total_attempts: 1,
        score: 38,
        status: "IN_PROGRESS"
    },

    feedback_submitted: false,

    questions: [
        {
            id: 1,
            question: "What is React?",
            options: [
                "Database",
                "JavaScript Library",
                "CSS Framework",
                "Backend Framework"
            ],
            answer: 1
        },
        {
            id: 2,
            question: "Which hook manages state?",
            options: [
                "useEffect",
                "useMemo",
                "useState",
                "useRef"
            ],
            answer: 2
        },
        {
            id: 3,
            question: "Who developed React?",
            options: [
                "Google",
                "Microsoft",
                "Meta",
                "Amazon"
            ],
            answer: 2
        }
    ]
};

export default mockExamData;
