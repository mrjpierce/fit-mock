
export class TestClass {
  propString: string = "string";
  propNumber: number = 1;

  funcString(str: string): string {
    return str;
  }

  funcNumber(num: number): number {
    console.log("original:", num); 
    return num;
  }
}