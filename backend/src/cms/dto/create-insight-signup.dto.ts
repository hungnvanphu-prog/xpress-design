import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInsightSignupDto {
  @IsEmail()
  email: string;

  @IsIn([
    'insights_feature_report',
    'insights_newsletter',
    'site_footer',
    'insights_footer',
  ])
  source:
    | 'insights_feature_report'
    | 'insights_newsletter'
    | 'site_footer'
    | 'insights_footer';

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;
}
