import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  posts!: PostDTO[];

  constructor(
    private postService: PostService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private sharedService: SharedService
  ) {
    this.loadPost();
  }

  private async loadPost(): Promise<void> {
    let errorResponse: any;
    const userId = this.localStorageService.get('user_id');
    if (userId) {
      try {
        this.posts = await this.postService.getPostsByUserId(
          userId
        );
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    }
  }

  createPost(): void {

    this.router.navigateByUrl('/user/post/');

  }

  updatePost(postId: string): void {

    this.router.navigateByUrl('/user/post/' + postId);
  }

  async deletePost(categoryId: string): Promise<void> {
    let errorResponse: any;

    // show confirmation popup
    let result = confirm(
      'Confirm delete category with id: ' + categoryId + ' .'
    );
    if (result) {
      try {
        const rowsAffected = await this.postService.deletePost(
          categoryId
        );
        if (rowsAffected.affected > 0) {
 
          this.loadPost();
        }
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    }
  }
}
