import { Injectable, NotImplementedException } from '@nestjs/common';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@Injectable()
export class AttemptService {
  submit(_submitAttemptDto : SubmitAttemptDto)
  {
    throw new NotImplementedException(
      'Attempt submission is not implemented yet'
    );
  }
}
