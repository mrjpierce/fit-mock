
export class TestClass {
  public propNumber = 1;
  public propString = "string";

  public funcNumber(num: number): number {
    console.log("original:", num);

    return num;
  }

  public funcString(str: string): string {
    return str;
  }
}
