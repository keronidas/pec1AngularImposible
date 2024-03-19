import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostDTO } from 'src/app/Models/post.dto';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss'],
})
export class PostsListComponent {
  post: PostDTO;
  title: UntypedFormControl;
  description: UntypedFormControl;
  num_likes: UntypedFormControl;
  num_dislikes: UntypedFormControl;
  publication_date: UntypedFormControl;

  postForm: UntypedFormGroup;
  isValidForm: boolean | null;
  private isUpdateMode: boolean;
  private validRequest: boolean;
  private postId: string | null;
  constructor(
    private postService: PostService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private sharedService: SharedService
  ) {
    // TODO 12 working on it!
    this.isValidForm = null;
    this.postId = this.activatedRoute.snapshot.paramMap.get('id');
    this.post = new PostDTO('', '', 0, 0, new Date());
    this.isUpdateMode = false;
    this.validRequest = false;

    this.title = new UntypedFormControl(this.post.title, [
      Validators.required,
      Validators.maxLength(55),
    ]);

    this.description = new UntypedFormControl(this.post.description, [
      Validators.required,
      Validators.maxLength(255),
    ]);

    this.num_likes = new UntypedFormControl(this.post.num_likes, [
      Validators.required,
      Validators.maxLength(7),
    ]);
    this.num_dislikes = new UntypedFormControl(this.post.num_dislikes, [
      Validators.required,
      Validators.maxLength(7),
    ]);
    this.publication_date = new UntypedFormControl(this.post.publication_date, [
      Validators.required
    ]);

    this.postForm = this.formBuilder.group({
      title: this.title,
      description: this.description,
      num_likes: this.num_likes,
      num_dislikes: this.num_dislikes,
      publication_date: this.publication_date,
    });
  }

  async ngOnInit(): Promise<void> {
    let errorResponse: any;

    // update
    if (this.postId) {
      this.isUpdateMode = true;
      try {
        this.post = await this.postService.getPostById(
          this.postId
        );

        this.title.setValue(this.post.title);

        this.description.setValue(this.post.description);

        this.num_likes.setValue(this.post.num_likes);
        this.num_dislikes.setValue(this.post.num_dislikes);
        this.publication_date.setValue(this.post.publication_date);

        this.postForm = this.formBuilder.group({
          title: this.title,
          description: this.description,
          css_color: this.css_color,
        });
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    }
  }

  private async editCategory(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;
    if (this.postId) {
      const userId = this.localStorageService.get('user_id');
      if (userId) {
        this.category.userId = userId;
        try {
          await this.categoryService.updateCategory(
            this.postId,
            this.category
          );
          responseOK = true;
        } catch (error: any) {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }

        await this.sharedService.managementToast(
          'categoryFeedback',
          responseOK,
          errorResponse
        );

        if (responseOK) {
          this.router.navigateByUrl('categories');
        }
      }
    }
    return responseOK;
  }

  private async createCategory(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;
    const userId = this.localStorageService.get('user_id');
    if (userId) {
      this.category.userId = userId;
      try {
        await this.categoryService.createCategory(this.category);
        responseOK = true;
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }

      await this.sharedService.managementToast(
        'categoryFeedback',
        responseOK,
        errorResponse
      );

      if (responseOK) {
        this.router.navigateByUrl('categories');
      }
    }

    return responseOK;
  }

  async saveCategory() {
    this.isValidForm = false;

    if (this.categoryForm.invalid) {
      return;
    }

    this.isValidForm = true;
    this.category = this.categoryForm.value;

    // TO DO 10 works!

    if (this.isUpdateMode) {
      this.validRequest = await this.editCategory();
    } else {
      this.validRequest = await this.createCategory();
    }
  }
}



