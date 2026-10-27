import { describe,it,expect } from 'vitest';
import { CSV_TEMPLATE,parseQuestionCsv } from './cbtPortal';
describe('CBT validated CSV imports',()=>{
 it('accepts four options and a single-correct answer',()=>{const r=parseQuestionCsv(CSV_TEMPLATE+'Question,A,B,C,D,,C,false,Physics,Motion,,4,1');expect(r.errors).toEqual([]);expect(r.questions[0]).toMatchObject({options:['A','B','C','D'],correct:[2],marks:4,negative:1});});
 it('accepts five options with multiple-correct answers',()=>{const r=parseQuestionCsv(CSV_TEMPLATE+'Question,A,B,C,D,E,A;E,true,Physics,Motion,,4,1');expect(r.questions[0]?.correct).toEqual([0,4]);});
 it('rejects an answer outside the provided options',()=>expect(parseQuestionCsv(CSV_TEMPLATE+'Question,A,B,C,D,,E,false,,,,,').questions).toHaveLength(0));
 it('rejects multiple answers for single-correct questions',()=>expect(parseQuestionCsv(CSV_TEMPLATE+'Question,A,B,C,D,,A;B,false,,,,,').errors.length).toBeGreaterThan(0));
 it('rejects a missing fourth option',()=>expect(parseQuestionCsv(CSV_TEMPLATE+'Question,A,B,C,,,A,false,,,,,').errors.length).toBeGreaterThan(0));
 it('rejects negative marks',()=>expect(parseQuestionCsv(CSV_TEMPLATE+'Question,A,B,C,D,,A,false,,,,-4,1').errors.length).toBeGreaterThan(0));
 it('rejects more than 500 questions',()=>expect(parseQuestionCsv(CSV_TEMPLATE+Array(501).fill('Question,A,B,C,D,,A,false,,,,,').join('\n')).questions).toHaveLength(0));
 it('handles quoted commas in question text',()=>expect(parseQuestionCsv(CSV_TEMPLATE+'"Question, with comma",A,B,C,D,,A,false,,,,,').questions[0]?.text).toBe('Question, with comma'));
});