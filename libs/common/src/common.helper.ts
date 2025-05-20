/**
 * 테스트 코드용 provide 모킹
 * useValue 부분에서 메소드 모킹 시 사용
 * @param {any} cls - 모킹할 클래스
 * @returns {any} - 메소드를 jest.fn으로 할당한뒤 객체 리턴
 */
export const setValueInJestProvide = (cls: any) => {
  const keys = Object.getOwnPropertyNames(cls.prototype).filter((method) => method !== 'constructor');
  const response = keys.reduce((acc: any, curr: string) => {
    acc[curr] = jest.fn();
    return acc;
  }, {});
  return response;
};
