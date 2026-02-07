import { ExamResult, OMRSheet } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, MinusCircle, Trophy, Target, Clock, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  result: ExamResult;
  sheet: OMRSheet;
}

const OPTIONS_4 = ['A', 'B', 'C', 'D'];
const OPTIONS_5 = ['A', 'B', 'C', 'D', 'E'];

export function ReportCard({ result, sheet }: ReportCardProps) {
  const options = sheet.optionsPerQuestion === 4 ? OPTIONS_4 : OPTIONS_5;
  const percentage = Math.round((result.score / result.maxScore) * 100);

  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', label: 'Outstanding', color: 'text-success' };
    if (percentage >= 80) return { grade: 'A', label: 'Excellent', color: 'text-success' };
    if (percentage >= 70) return { grade: 'B', label: 'Good', color: 'text-primary' };
    if (percentage >= 60) return { grade: 'C', label: 'Average', color: 'text-warning' };
    if (percentage >= 50) return { grade: 'D', label: 'Below Average', color: 'text-warning' };
    return { grade: 'F', label: 'Needs Improvement', color: 'text-destructive' };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const { grade, label, color } = getGrade();

  return (
    <div className="space-y-6 print:space-y-4" id="report-card">
      {/* Header */}
      <div className="text-center p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Award className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Exam Report Card</h1>
        </div>
        <p className="text-muted-foreground">{result.sheetTitle}</p>
        <p className="text-sm text-muted-foreground">
          {result.completedAt.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-warning" />
            <p className="text-3xl font-bold">{result.score}</p>
            <p className="text-sm text-muted-foreground">out of {result.maxScore}</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className={cn("text-4xl font-bold mb-1", color)}>{grade}</div>
            <p className="text-sm text-muted-foreground">{label}</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold">{result.accuracy}%</p>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-3xl font-bold">{formatTime(result.timeSpent)}</p>
            <p className="text-sm text-muted-foreground">Time Taken</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-success/10">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold text-success">{result.correct}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10">
              <XCircle className="w-6 h-6 mx-auto mb-2 text-destructive" />
              <p className="text-2xl font-bold text-destructive">{result.wrong}</p>
              <p className="text-sm text-muted-foreground">Wrong</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <MinusCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{result.unattempted}</p>
              <p className="text-sm text-muted-foreground">Unattempted</p>
            </div>
          </div>

          {sheet.negativeMarking > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
              <p><strong>Marking Scheme:</strong> +{sheet.marksPerQuestion} for correct, -{sheet.negativeMarking} for wrong</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question-wise Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question-wise Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Q.No</th>
                  <th className="text-center py-3 px-2">Your Answer</th>
                  <th className="text-center py-3 px-2">Correct Answer</th>
                  <th className="text-center py-3 px-2">Result</th>
                  <th className="text-right py-3 px-2">Marks</th>
                </tr>
              </thead>
              <tbody>
                {result.questionResults.map((qr, index) => {
                  const correctAnswerDisplay = Array.isArray(qr.correctAnswer) 
                    ? qr.correctAnswer.map(a => options[a]).join(', ')
                    : options[qr.correctAnswer];
                  
                  return (
                    <tr key={index} className={cn(
                      "border-b",
                      qr.isCorrect ? "bg-success/5" : qr.userAnswer === null ? "" : "bg-destructive/5"
                    )}>
                      <td className="py-3 px-2 font-medium">{qr.questionNumber}</td>
                      <td className="text-center py-3 px-2">
                        {qr.userAnswer !== null ? (
                          <span className={cn(
                            "inline-flex items-center justify-center w-8 h-8 rounded-full font-medium",
                            qr.isCorrect ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
                          )}>
                            {options[qr.userAnswer]}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-success/20 text-success font-medium">
                          {correctAnswerDisplay}
                        </span>
                      </td>
                      <td className="text-center py-3 px-2">
                        {qr.userAnswer === null ? (
                          <span className="text-muted-foreground">Skipped</span>
                        ) : qr.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-success mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive mx-auto" />
                        )}
                      </td>
                      <td className="text-right py-3 px-2 font-medium">
                        <span className={cn(
                          qr.marksObtained > 0 ? "text-success" : 
                          qr.marksObtained < 0 ? "text-destructive" : ""
                        )}>
                          {qr.marksObtained > 0 ? `+${qr.marksObtained}` : qr.marksObtained}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={4} className="py-3 px-2 text-right">Total Score:</td>
                  <td className="py-3 px-2 text-right text-lg">{result.score}/{result.maxScore}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
