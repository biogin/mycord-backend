
export interface UseCase<Request = any, Result = any> {
  execute(request: Request): Result;
}
