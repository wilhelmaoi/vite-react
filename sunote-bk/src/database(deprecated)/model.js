import { Model } from '@nozbe/watermelondb';
import { text, field, date } from '@nozbe/watermelondb/decorators';

export default class User extends Model {
  static table = 'users';

  @text('username') username;
  @text('email') email;
  @text('password_hash') passwordHash;
  @text('avatar') avatarUrl;
  @text('bio') bio;

  @field('created_at') createdAt;
  @field('updated_at') updatedAt;

  // 更新用户信息的方法
  async updateProfile({ username, email, bio, avatarUrl }) {
    await this.update(user => {
      if (username) user.username = username;
      if (email) user.email = email;
      if (bio !== undefined) user.bio = bio;
      if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
      user.updatedAt = Date.now(); // 更新时间
    });
  }
}
