import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryDTO } from 'src/app/Models/category.dto';
import { PostDTO } from 'src/app/Models/post.dto';
import { CategoryService } from 'src/app/Services/category.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
})
export class PostFormComponent implements OnInit {

  registerPost: PostDTO;
  postId!: string | null;
  title!: UntypedFormControl;
  description!: UntypedFormControl;
  num_likes!: number;
  num_dislikes!: number;
  publication_date!: UntypedFormControl;
  isValidForm: boolean | null;
  registerForm: FormGroup;
  categories!: UntypedFormControl;
  categoryList!: CategoryDTO[]|null;

  private isUpdateMode: boolean;
  private validRequest: boolean;




  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private localStorageService: LocalStorageService,
    private categoryService: CategoryService
  ) {
    this.cargarCategorias();
    this.validRequest = false;
    this.isUpdateMode = false;
    this.registerPost = new PostDTO("", "", 0, 0, new Date());
    this.isValidForm = null;
    this.registerForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(55)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      categories: ['', [Validators.required]],
      publication_date: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
    });
  } 
  async cargarCategorias() {
    try {
        const userId = this.localStorageService.get('user_id');
        if (userId) {
            this.categoryList = await this.categoryService.getCategoriesByUserId(userId);
        }
    } catch (error) {
        // Manejar el error
        console.error('Error al cargar las categorías:', error);
    }
}

  // TO DO 13
  async ngOnInit(): Promise<void> {
    let errorResponse: any;

    // update
    if (this.postId) {

      try {
        this.registerPost = await this.postService.getPostById(
          this.postId
        );

        this.title.setValue(this.registerPost.title);
        this.description.setValue(this.registerPost.description);
        this.categories.setValue(this.registerPost.categories);
        this.publication_date.setValue(this.registerPost.publication_date);


        this.registerForm = this.formBuilder.group({
          title: this.title,
          description: this.description,
          publication_date: this.publication_date,
          categories: this.categories,
        });
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    }

  }
  private async ediPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;
    if (this.postId) {
      const userId = this.localStorageService.get('user_id');
      if (userId) {
        this.registerPost.userId = userId;
        try {
          await this.postService.updatePost(
            this.postId,
            this.registerPost
          );
          responseOK = true;
        } catch (error: any) {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }

        await this.sharedService.managementToast(
          'postFeedback',
          responseOK,
          errorResponse
        );

        if (responseOK) {
          this.router.navigateByUrl('posts');
        }
      }
    }
    return responseOK;
  }

  private async createPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;
    const userId = this.localStorageService.get('user_id');
    if (userId) {
      this.registerPost.userId = userId;
      try {
        await this.postService.createPost(this.registerPost);
        responseOK = true;
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }

      await this.sharedService.managementToast(
        'postFeedback',
        responseOK,
        errorResponse
      );

      if (responseOK) {
        this.router.navigateByUrl('post');
      }
    }

    return responseOK;
  }

  async savePost() {
  
    this.isValidForm = false;

    if (this.registerForm.invalid) {
      return;
    }

    this.isValidForm = true;
    this.registerPost = this.registerForm.value;

    // TO DO 10 works!

    if (this.isUpdateMode) {
      this.validRequest = await this.ediPost();
    } else {
      this.validRequest = await this.createPost();
    }
    this.router.navigateByUrl('posts');
  }

  enviarDatos() {
   
  }
}
