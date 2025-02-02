interface DailyRidershipData {
  date: string;
  ridership: number;
}

class CtaElDailyRidership {
  private data: DailyRidershipData[];

  constructor() {
    this.data = [
      { date: '2023-01-01', ridership: 1000 },
      { date: '2023-01-02', ridership: 1500 },
      // Add more data as needed
    ];
  }

  fetch(): CtaElDailyRidership {
    return this;
  }

  toJson(): DailyRidershipData[] {
    return this.data;
  }
}

export default new CtaElDailyRidership();
