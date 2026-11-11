import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BrandThemeService } from '@libs/theme';

/** The three fictional demo brands, in the order the switcher shows them. */
const DEMO_BRANDS = [
  { id: 'solstice', labelKey: 'HOME.BRAND_SOLSTICE' },
  { id: 'harbor', labelKey: 'HOME.BRAND_HARBOR' },
  { id: 'meadow', labelKey: 'HOME.BRAND_MEADOW' },
] as const;

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly brandService = inject(BrandThemeService);

  protected readonly activeBrand = this.brandService.theme;
  protected readonly brands = DEMO_BRANDS;

  protected selectBrand(id: string): void {
    void this.brandService.applyBrand(id);
  }
}
