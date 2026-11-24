import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

const featureHeadings = [
  'How to Check Your NEET & JEE OMR Sheet Online in Seconds',
  'Accurate +4 / -1 Negative Marking & Subject-Wise Score Analysis',
  'Compatible with NTA NEET UG, JEE Main, CUET & Coaching Test Series',
];

const faqQuestions = [
  'How do I check my NEET or JEE OMR sheet online using AI?',
  'Is Smart AI OMR Analysis free for students?',
  'Does the OMR checker calculate negative marking (+4 and -1) automatically?',
  'Can I scan a photo of my OMR sheet taken from my mobile phone?',
  'Which exams are supported by Smart AI OMR Analysis?',
];

function renderHomepage() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/']}>
        <LandingPage />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('homepage search content', () => {
  it('has exactly one H1 with the requested NEET and JEE search intent', () => {
    renderHomepage();

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Smart AI OMR Analysis: Instant Online OMR Sheet Checker for NEET & JEE');
  });

  it.each(featureHeadings)('uses the requested H2: %s', (heading) => {
    renderHomepage();

    expect(screen.getByRole('heading', { level: 2, name: heading })).toBeVisible();
  });

  it('shows all five requested FAQs and their answers near the bottom', () => {
    renderHomepage();

    const faqSection = screen.getByRole('region', { name: 'NEET & JEE OMR Checker: Frequently Asked Questions' });
    faqQuestions.forEach((question) => {
      expect(screen.getByRole('heading', { level: 3, name: question })).toBeVisible();
    });
    expect(faqSection).toHaveTextContent('Not at present. The current checker does not read uploaded sheet photos.');
    expect(faqSection).toHaveTextContent('Set +4 marks for each correct answer and a -1 deduction');
    expect(faqSection.querySelectorAll('article')).toHaveLength(5);
  });

  it('gives every homepage image descriptive alternative text', () => {
    const { container } = renderHomepage();

    const images = Array.from(container.querySelectorAll('img'));
    expect(images.length).toBeGreaterThan(0);
    images.forEach((image) => {
      expect(image.alt.trim().length).toBeGreaterThan(10);
    });
  });
});
