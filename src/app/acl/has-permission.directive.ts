import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AclService } from './acl.service';
import { Permission } from './permission.model';

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private aclService = inject(AclService);
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private hasView = false;

  @Input() set hasPermission(permission: Permission) {
    this.updateView(permission);
  }

  private updateView(permission: Permission): void {
    if (this.aclService.can(permission)) {
      if (!this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      }
    } else {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
