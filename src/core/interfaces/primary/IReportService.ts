export interface IReportService {
  getSummary(userId: string, from: Date, to: Date): Promise<any>;
  getPomodoroReport(userId: string, from: Date, to: Date): Promise<any>;
}
