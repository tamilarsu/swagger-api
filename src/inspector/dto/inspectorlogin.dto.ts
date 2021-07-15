import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class inspectoruserlogin {
    @ApiProperty({
        description: 'example:eee@example.com',
    })
    @IsNotEmpty()
    readonly email_id: string;
    
    @ApiProperty({
        description: 'example:passworrd145',
    })
    @IsNotEmpty()
    readonly password: string;
}
