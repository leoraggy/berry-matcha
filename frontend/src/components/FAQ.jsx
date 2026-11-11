import { useId, useState } from "react";
import styles from "./styles/FAQ.module.css";

const accordionData = [
  { title: "Do you take delivery?", content: "Currently pickup only." },
  {
    title: "When are you available for pickups?",
    content:
      "My availability changes each quarter. You can find my current pickup availability here.",
  },
  { title: "Do you have toppings?", content: "Not at the moment." },
  {
    title: "Can I adjust sweetness and ice level?",
    content: "Yes, at checkout you can adjust!",
  },
  {
    title: "Who made this website?",
    content:
      "Leo and Erica! Leo Ragual is the developer, Erica made the cute logo and art. For contact: linkedin.com/in/leoragual/",
  },
];

function FAQ() {
  const accordionId = useId();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex((currentIndex) => (currentIndex === index ? null : index));
  };

  return (
    <section className={styles.faq} aria-labelledby={`${accordionId}-heading`}>
      <h2 id={`${accordionId}-heading`} className={styles.heading}>
        FAQ
      </h2>
      <div className={styles.accordion}>
        {accordionData.map((item, index) => {
          const isOpen = openIndex === index;
          const buttonId = `${accordionId}-question-${index}`;
          const panelId = `${accordionId}-answer-${index}`;

          return (
            <div className={styles.item} key={item.title}>
              <button
                id={buttonId}
                type="button"
                onClick={() => toggleAccordion(index)}
                className={`${styles.question}${isOpen ? ` ${styles.active}` : ""}`}
              >
                {item.title}
              </button>
              <div
                id={panelId}
                role="region"
                className={`${styles.panel}${isOpen ? ` ${styles.panelOpen}` : ""}`}
              >
                <div className={styles.panelContent}>
                  <p>{item.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FAQ;
