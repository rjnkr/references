import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from '../../../generated/nestjs-dto/product.dto';

/** A module with the products it references, flattened out of the join table. */
export class ModuleResponseDto {
  @ApiProperty({ type: 'integer' })
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [Number] })
  productIds: number[];

  @ApiProperty({ type: ProductDto, isArray: true })
  products: ProductDto[];
}
